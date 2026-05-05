package com.serds.aspect;

import org.aspectj.lang.ProceedingJoinPoint;
import org.aspectj.lang.annotation.*;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Component;

// Cross-cutting concern — logs all service calls and controller exceptions automatically
@Aspect
@Component
public class LoggingAspect {

    private static final Logger log = LoggerFactory.getLogger(LoggingAspect.class);

    // Wraps every service method — logs entry, exit, and execution time
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

    // Catches and logs any exception thrown from controllers
    @AfterThrowing(pointcut = "execution(* com.serds.controller.*.*(..))", throwing = "ex")
    public void logControllerErrors(Exception ex) {
        log.error("🔥 Controller error: {} — {}", ex.getClass().getSimpleName(), ex.getMessage());
    }
}
