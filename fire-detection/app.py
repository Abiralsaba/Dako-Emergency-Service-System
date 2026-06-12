
import io
import logging
from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from PIL import Image
import numpy as np

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("fire-detection")

app = FastAPI(
    title="DAKO Fire Detection Service",
    description="AI-powered fire detection for the DAKO Emergency Dispatch System",
    version="1.0.0"
)

# Allow CORS from Spring Boot backend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)


def rgb_to_hsv_array(rgb_array: np.ndarray) -> np.ndarray:
    """Convert an RGB image array (H, W, 3) with values in [0, 255] to HSV.
    Returns HSV with H in [0, 360), S in [0, 1], V in [0, 1].
    """
    rgb_norm = rgb_array.astype(np.float32) / 255.0
    r, g, b = rgb_norm[:, :, 0], rgb_norm[:, :, 1], rgb_norm[:, :, 2]

    c_max = np.maximum(np.maximum(r, g), b)
    c_min = np.minimum(np.minimum(r, g), b)
    delta = c_max - c_min

    # Hue calculation
    hue = np.zeros_like(delta)
    mask_r = (c_max == r) & (delta > 0)
    mask_g = (c_max == g) & (delta > 0)
    mask_b = (c_max == b) & (delta > 0)

    hue[mask_r] = 60.0 * (((g[mask_r] - b[mask_r]) / delta[mask_r]) % 6)
    hue[mask_g] = 60.0 * (((b[mask_g] - r[mask_g]) / delta[mask_g]) + 2)
    hue[mask_b] = 60.0 * (((r[mask_b] - g[mask_b]) / delta[mask_b]) + 4)

    # Saturation
    sat = np.where(c_max > 0, delta / c_max, 0)

    # Value
    val = c_max

    return np.stack([hue, sat, val], axis=-1)


def analyze_fire(image: Image.Image) -> dict:
    """
    Analyze an image for fire/flame presence using multiple detection methods.
    Returns a dict with fire_detected (bool), confidence (0-1), and details (str).
    
    Tuned for REAL fire photos where fire typically covers only 10-30% of the frame,
    with the rest being sky, smoke, buildings, grass, people, etc.
    """
    # Resize for consistent and fast processing
    img = image.convert("RGB").resize((320, 320))
    pixels = np.array(img)

    total_pixels = pixels.shape[0] * pixels.shape[1]
    r, g, b = pixels[:, :, 0].astype(float), pixels[:, :, 1].astype(float), pixels[:, :, 2].astype(float)

    # ── ANTI-FALSE-POSITIVE: Vegetation/Nature Detection ──
    # Green-dominant pixels (leaves, grass, trees) — these are NOT fire
    green_mask = (
        (g > r) & (g > b) & (g > 80) &  # Green is dominant channel
        (g - r > 10)                       # Clear green dominance
    )
    green_ratio = np.sum(green_mask) / total_pixels

    # Also detect yellow-green (sunlit leaves): high G, moderate R, low B
    yellow_green = (
        (g > 120) & (r > 100) & (b < 120) &
        (g > b) &
        (np.abs(r - g) < 50) &  # R and G are close = yellow/green, NOT fire
        (g - b > 30)
    )
    yellow_green_ratio = np.sum(yellow_green) / total_pixels

    is_vegetation_scene = (green_ratio + yellow_green_ratio) > 0.25

    # ── Method 1: Fire Color Pixel Detection (RGB — strict red dominance) ──
    # Fire MUST have R >> G. Sunlit leaves have R ≈ G, which is NOT fire.
    fire_mask_rgb = (
        (r > 170) & (g > 50) & (b < 130) &
        (r > g) & (r > b) &
        (r - g > 40) &   # STRONG red over green gap (eliminates yellow/nature)
        (r - b > 60)     # Strong red-blue gap
    )
    fire_pixel_ratio_rgb = np.sum(fire_mask_rgb) / total_pixels

    # Strict fire pixels: unmistakably fire-colored (deep orange/red)
    strict_fire = (
        (r > 200) & (g > 60) & (g < 200) & (b < 80) &
        (r > g) &
        (r - g > 50) &   # Very strong red dominance
        (r - b > 100)
    )
    strict_fire_ratio = np.sum(strict_fire) / total_pixels

    # ── Method 2: HSV Color Space Analysis ──
    hsv = rgb_to_hsv_array(pixels)
    h, s, v = hsv[:, :, 0], hsv[:, :, 1], hsv[:, :, 2]

    # Fire hues: red (0-40°) and deep red (340-360°) — EXCLUDE yellow-green (50-170°)
    fire_mask_hsv = (
        ((h < 40) | (h > 340)) &    # Red-orange hues only (not yellow-green)
        (s > 0.30) &                  # Reasonably saturated
        (v > 0.40) &                  # Reasonably bright
        ~green_mask                   # Explicitly exclude green pixels
    )
    fire_pixel_ratio_hsv = np.sum(fire_mask_hsv) / total_pixels

    # ── Method 3: Bright Spot Detection (intense flames) ──
    brightness = (r + g + b) / 3.0

    # Bright warm spots — must have red dominance (not just bright yellow/white)
    bright_warm = (
        (brightness > 170) & (r > g) & (r > b) &
        (r > 180) & (r - g > 20) &   # Must still be red-dominant
        ~green_mask                    # Not green
    )
    bright_warm_ratio = np.sum(bright_warm) / total_pixels

    # ── Method 4: Smoke Detection ──
    smoke_mask = (
        (np.abs(r - g) < 25) & (np.abs(g - b) < 25) & (np.abs(r - b) < 25) &
        (brightness > 60) & (brightness < 180) &
        (s < 0.12)
    )
    smoke_ratio = np.sum(smoke_mask) / total_pixels

    # ── Method 5: Texture Variance ──
    gray = np.mean(pixels.astype(float), axis=2)
    from numpy.lib.stride_tricks import sliding_window_view
    if gray.shape[0] >= 5 and gray.shape[1] >= 5:
        windows = sliding_window_view(gray, (5, 5))
        local_var = np.var(windows, axis=(-1, -2))
        high_var_ratio = np.sum(local_var > 600) / local_var.size
    else:
        high_var_ratio = 0

    # ── Method 6: Orange-Yellow Warm Glow ──
    warm_glow = (
        (r > 190) & (g > 100) & (g < 200) & (b < 80) &
        (r - g > 30) &   # Must have red dominance
        (r - b > 100) &
        ~green_mask       # Not green
    )
    warm_glow_ratio = np.sum(warm_glow) / total_pixels

    # ── Method 7: Overall Red Channel Dominance ──
    mean_r, mean_g, mean_b = np.mean(r), np.mean(g), np.mean(b)
    red_dominance = max(0, (mean_r - mean_b) / 255.0)
    # Suppress if green is dominant overall
    if mean_g > mean_r:
        red_dominance = 0

    # ── Combine all signals into confidence ──
    confidence = 0.0

    # Primary signals
    confidence += min(fire_pixel_ratio_rgb * 10.0, 0.30)
    confidence += min(strict_fire_ratio * 20.0, 0.30)
    confidence += min(fire_pixel_ratio_hsv * 6.0, 0.20)

    # Secondary signals
    confidence += min(bright_warm_ratio * 8.0, 0.10)
    confidence += min(warm_glow_ratio * 12.0, 0.15)
    confidence += min(high_var_ratio * 2.0, 0.05)
    confidence += min(red_dominance * 0.3, 0.05)

    # Smoke + fire signal bonus
    has_any_fire_signal = (fire_pixel_ratio_rgb > 0.02 or strict_fire_ratio > 0.01 or warm_glow_ratio > 0.01)
    if smoke_ratio > 0.1 and has_any_fire_signal:
        confidence += 0.10

    # ── VEGETATION PENALTY ──
    # If the scene is mostly green, heavily penalize fire confidence
    if is_vegetation_scene:
        confidence *= 0.15  # 85% reduction for vegetation scenes
        logger.info(f"Vegetation detected ({green_ratio:.1%} green + {yellow_green_ratio:.1%} yellow-green) — confidence reduced")

    # Count active signals
    signals_active = sum([
        fire_pixel_ratio_rgb > 0.02,
        strict_fire_ratio > 0.01,
        fire_pixel_ratio_hsv > 0.03,
        bright_warm_ratio > 0.02,
        warm_glow_ratio > 0.01,
        high_var_ratio > 0.05,
        smoke_ratio > 0.1,
    ])

    # Multi-signal agreement
    if signals_active >= 4:
        confidence = min(1.0, confidence * 1.3)
    elif signals_active <= 1:
        confidence *= 0.5

    confidence = min(1.0, max(0.0, confidence))

    # ── PRIMARY FIRE SIGNAL REQUIRED ──
    has_primary_fire = (
        fire_pixel_ratio_rgb > 0.02 or
        strict_fire_ratio > 0.01 or
        warm_glow_ratio > 0.015
    )

    # Fire detection: confidence > 30% AND primary fire evidence AND not a vegetation scene
    fire_detected = confidence > 0.30 and has_primary_fire and not is_vegetation_scene

    # Build detail string
    details_parts = []
    if strict_fire_ratio > 0.005:
        details_parts.append(f"Flames: {strict_fire_ratio:.1%}")
    if fire_pixel_ratio_rgb > 0.01:
        details_parts.append(f"Fire-colored: {fire_pixel_ratio_rgb:.1%}")
    if fire_pixel_ratio_hsv > 0.02:
        details_parts.append(f"HSV fire: {fire_pixel_ratio_hsv:.1%}")
    if warm_glow_ratio > 0.005:
        details_parts.append(f"Warm glow: {warm_glow_ratio:.1%}")
    if bright_warm_ratio > 0.01:
        details_parts.append(f"Bright fire: {bright_warm_ratio:.1%}")
    if smoke_ratio > 0.1:
        details_parts.append(f"Smoke: {smoke_ratio:.1%}")

    if fire_detected:
        details = "🔥 Fire/flame patterns detected: " + ", ".join(details_parts) if details_parts else "Fire patterns detected"
    else:
        if is_vegetation_scene:
            details = "Image appears to show vegetation/nature — no fire detected"
        else:
            details = "No significant fire patterns detected in the image"

    logger.info(
        f"Analysis | fire={fire_detected} | conf={confidence:.2f} | "
        f"rgb={fire_pixel_ratio_rgb:.3f} | strict={strict_fire_ratio:.3f} | "
        f"hsv={fire_pixel_ratio_hsv:.3f} | glow={warm_glow_ratio:.3f} | "
        f"bright={bright_warm_ratio:.3f} | smoke={smoke_ratio:.3f} | "
        f"var={high_var_ratio:.3f} | green={green_ratio:.3f} | "
        f"veg={is_vegetation_scene} | signals={signals_active}"
    )

    return {
        "fire_detected": bool(fire_detected),
        "confidence": round(float(confidence), 2),
        "details": details
    }


@app.get("/health")
async def health_check():
    """Health check endpoint for Spring Boot to verify service is running."""
    return {"status": "ok", "service": "fire-detection"}


@app.post("/detect")
async def detect_fire(file: UploadFile = File(...)):
    """
    Analyze an uploaded image for fire/flame detection.
    
    Accepts: multipart/form-data with 'file' field (JPEG, PNG, WebP)
    Returns: { fire_detected: bool, confidence: float, details: str }
    """
    # Validate file type
    allowed_types = ["image/jpeg", "image/png", "image/webp", "image/jpg"]
    if file.content_type and file.content_type not in allowed_types:
        raise HTTPException(
            status_code=400,
            detail=f"Invalid file type: {file.content_type}. Upload JPEG, PNG, or WebP."
        )

    try:
        # Read image bytes
        contents = await file.read()
        if len(contents) == 0:
            raise HTTPException(status_code=400, detail="Empty file uploaded")

        if len(contents) > 10 * 1024 * 1024:  # 10MB limit
            raise HTTPException(status_code=400, detail="File too large. Maximum 10MB.")

        logger.info(f"Received image: {file.filename} ({len(contents)} bytes, {file.content_type})")

        # Open and analyze
        image = Image.open(io.BytesIO(contents))
        result = analyze_fire(image)

        logger.info(f"Result: fire_detected={result['fire_detected']}, confidence={result['confidence']}")
        return result

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error analyzing image: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Failed to analyze image: {str(e)}")


if __name__ == "__main__":
    import uvicorn
    print("=" * 50)
    print("🔥 DAKO Fire Detection Service")
    print("=" * 50)
    print("Starting on http://localhost:5001")
    print("Endpoints:")
    print("  POST /detect  — Analyze image for fire")
    print("  GET  /health  — Health check")
    print("=" * 50)
    uvicorn.run(app, host="0.0.0.0", port=5001)
