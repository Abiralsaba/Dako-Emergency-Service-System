package com.serds.aspect;

import org.aspectj.lang.JoinPoint;
import org.aspectj.lang.ProceedingJoinPoint;
import org.aspectj.lang.annotation.AfterReturning;
import org.aspectj.lang.annotation.AfterThrowing;
import org.aspectj.lang.annotation.Around;
import org.aspectj.lang.annotation.Aspect;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Component;

import com.serds.entity.AuditLog;
import com.serds.repository.AuditLogRepository;

@Aspect
@Component
public class LoggingAspect {

    private static final Logger log = LoggerFactory.getLogger(LoggingAspect.class);

    // Injecting the AuditLogRepository to persist audit entries to the database
    private final AuditLogRepository auditLogRepository;

    public LoggingAspect(AuditLogRepository auditLogRepository) {
        this.auditLogRepository = auditLogRepository;
    }

    /**
     * Wraps every service method — logs entry, exit, and execution time.
     *
     * This is the @Around advice: it runs BEFORE and AFTER the target method.
     * We measure elapsed time to help identify slow queries or bottlenecks.
     */
    @Around("execution(* com.serds.service.*.*(..))")
    public Object logServiceCalls(ProceedingJoinPoint jp) throws Throwable {
        String method = jp.getSignature().toShortString();
        log.info("▶ {}", method);

        long start = System.currentTimeMillis();
        Object result = jp.proceed();
        long elapsed = System.currentTimeMillis() - start;

        log.info("◀ {} completed in {}ms", method, elapsed);
        return result;
    }

    /**
     * Catches and logs any exception thrown from controllers.
     *
     * This is @AfterThrowing advice — it only fires when an exception occurs.
     * Helps us quickly find the source of HTTP 500 errors in production.
     */
    @AfterThrowing(pointcut = "execution(* com.serds.controller.*.*(..))", throwing = "ex")
    public void logControllerErrors(Exception ex) {
        log.error("🔥 Controller error: {} — {}", ex.getClass().getSimpleName(), ex.getMessage());
    }

    // ═══════════════════════════════════════════════════════════
    //  AUDIT LOG — Persisting critical actions to the database
    //  These @AfterReturning advices fire ONLY on successful execution
    // ═══════════════════════════════════════════════════════════

    /**
     * Audit: User Login — records every successful authentication.
     * Matches AuthService.login() method calls.
     */
    @AfterReturning(pointcut = "execution(* com.serds.service.AuthService.login(..))", returning = "result")
    public void auditLogin(JoinPoint jp, Object result) {
        try {
            // Extract phone number from the first argument (login request)
            Object[] args = jp.getArgs();
            String detail = args.length > 0 ? "Phone: " + args[0].toString() : "Login attempt";

            AuditLog entry = new AuditLog(
                null,           // userId — we don't have it here easily
                "UNKNOWN",      // role — determined after login
                "USER_LOGIN",
                "User",
                null,
                detail
            );
            auditLogRepository.save(entry);
            log.debug("📝 Audit: login recorded");
        } catch (Exception e) {
            // Audit logging should never break the main flow
            log.warn("Audit log failed for login: {}", e.getMessage());
        }
    }

    /**
     * Audit: Emergency Created (SOS) — records every new emergency request.
     * This is critical for accountability — every SOS must be traceable.
     */
    @AfterReturning(pointcut = "execution(* com.serds.service.EmergencyService.createEmergency(..))", returning = "result")
    public void auditEmergencyCreated(JoinPoint jp, Object result) {
        try {
            Object[] args = jp.getArgs();
            String detail = "New emergency created";
            if (args.length > 0) {
                detail = "Emergency type: " + args[0].toString();
            }

            AuditLog entry = new AuditLog(
                null,
                "CITIZEN",
                "SOS_CREATED",
                "EmergencyRequest",
                null,
                detail
            );
            auditLogRepository.save(entry);
            log.debug("📝 Audit: SOS created");
        } catch (Exception e) {
            log.warn("Audit log failed for SOS creation: {}", e.getMessage());
        }
    }

    /**
     * Audit: Offer Accepted — records when a responder accepts an emergency offer.
     * Tracks which responder took responsibility for which emergency.
     */
    @AfterReturning(pointcut = "execution(* com.serds.service.EmergencyService.acceptOffer(..))", returning = "result")
    public void auditOfferAccepted(JoinPoint jp, Object result) {
        try {
            Object[] args = jp.getArgs();
            String detail = "Offer accepted";
            if (args.length > 0) {
                detail = "Emergency #" + args[0].toString() + " offer accepted";
            }

            AuditLog entry = new AuditLog(
                null,
                "RESPONDER",
                "OFFER_ACCEPTED",
                "EmergencyRequest",
                null,
                detail
            );
            auditLogRepository.save(entry);
            log.debug("📝 Audit: offer accepted");
        } catch (Exception e) {
            log.warn("Audit log failed for offer accept: {}", e.getMessage());
        }
    }

    /**
     * Audit: Offer Declined — records when a responder declines an emergency offer.
     * Important for tracking responder reliability scores.
     */
    @AfterReturning(pointcut = "execution(* com.serds.service.EmergencyService.declineOffer(..))", returning = "result")
    public void auditOfferDeclined(JoinPoint jp, Object result) {
        try {
            Object[] args = jp.getArgs();
            String detail = "Offer declined";
            if (args.length > 0) {
                detail = "Emergency #" + args[0].toString() + " offer declined";
            }

            AuditLog entry = new AuditLog(
                null,
                "RESPONDER",
                "OFFER_DECLINED",
                "EmergencyRequest",
                null,
                detail
            );
            auditLogRepository.save(entry);
            log.debug("📝 Audit: offer declined");
        } catch (Exception e) {
            log.warn("Audit log failed for offer decline: {}", e.getMessage());
        }
    }

    /**
     * Audit: Emergency Status Changed — records every status transition
     * (EN_ROUTE → ARRIVED → IN_PROGRESS → COMPLETED).
     * Creates a complete timeline of the emergency response.
     */
    @AfterReturning(pointcut = "execution(* com.serds.service.EmergencyService.updateEmergencyStatus(..))", returning = "result")
    public void auditStatusChange(JoinPoint jp, Object result) {
        try {
            Object[] args = jp.getArgs();
            String detail = "Status updated";
            if (args.length >= 2) {
                detail = "Emergency #" + args[0].toString() + " → " + args[1].toString();
            }

            AuditLog entry = new AuditLog(
                null,
                "RESPONDER",
                "STATUS_CHANGE",
                "EmergencyRequest",
                args.length > 0 ? Long.valueOf(args[0].toString()) : null,
                detail
            );
            auditLogRepository.save(entry);
            log.debug("📝 Audit: status changed");
        } catch (Exception e) {
            log.warn("Audit log failed for status change: {}", e.getMessage());
        }
    }

    /**
     * Audit: Responder Approved — records when an admin approves a responder account.
     * Critical for accountability in the approval workflow.
     */
    @AfterReturning(pointcut = "execution(* com.serds.service.EmergencyService.approveResponder(..))", returning = "result")
    public void auditResponderApproved(JoinPoint jp, Object result) {
        try {
            Object[] args = jp.getArgs();
            Long responderId = args.length > 0 ? Long.valueOf(args[0].toString()) : null;

            AuditLog entry = new AuditLog(
                null,
                "ADMIN",
                "RESPONDER_APPROVED",
                "Responder",
                responderId,
                "Responder #" + responderId + " approved by admin"
            );
            auditLogRepository.save(entry);
            log.debug("📝 Audit: responder #{} approved", responderId);
        } catch (Exception e) {
            log.warn("Audit log failed for responder approval: {}", e.getMessage());
        }
    }

    /**
     * Audit: Responder Rejected — records when an admin rejects a responder.
     */
    @AfterReturning(pointcut = "execution(* com.serds.service.EmergencyService.rejectResponder(..))", returning = "result")
    public void auditResponderRejected(JoinPoint jp, Object result) {
        try {
            Object[] args = jp.getArgs();
            Long responderId = args.length > 0 ? Long.valueOf(args[0].toString()) : null;

            AuditLog entry = new AuditLog(
                null,
                "ADMIN",
                "RESPONDER_REJECTED",
                "Responder",
                responderId,
                "Responder #" + responderId + " rejected by admin"
            );
            auditLogRepository.save(entry);
            log.debug("📝 Audit: responder #{} rejected", responderId);
        } catch (Exception e) {
            log.warn("Audit log failed for responder rejection: {}", e.getMessage());
        }
    }
}
