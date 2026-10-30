package com.aisdlc.pm;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.context.properties.ConfigurationPropertiesScan;
import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication
@EnableScheduling
@ConfigurationPropertiesScan
public class AiSdlcPmApplication {
    public static void main(String[] args) {
        SpringApplication.run(AiSdlcPmApplication.class, args);
    }
}
