package com.serds;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.EnableAspectJAutoProxy;

@SpringBootApplication
@EnableAspectJAutoProxy // Enables AOOP aspects
public class SerdsApplication {

    public static void main(String[] args) {
        SpringApplication.run(SerdsApplication.class, args);
    }
}
