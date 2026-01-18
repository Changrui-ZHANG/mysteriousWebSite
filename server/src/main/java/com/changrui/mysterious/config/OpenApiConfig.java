package com.changrui.mysterious.config;

import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Contact;
import io.swagger.v3.oas.models.info.Info;
import io.swagger.v3.oas.models.servers.Server;
import java.util.List;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

/**
 * Configuration for OpenAPI/Swagger documentation.
 */
@Configuration
public class OpenApiConfig {

        @Bean
        public OpenAPI mysteriousOpenAPI() {
                return new OpenAPI()
                                .info(new Info()
                                                .title("Mysterious Website API")
                                                .description("Backend API for the Mysterious Website - Message Wall, Games, User Profiles")
                                                .version("1.0.0")
                                                .contact(new Contact()
                                                                .name("Changrui")
                                                                .email("m.zhang.changrui@gmail.com")))
                                .servers(List.of(
                                                new Server().url("http://localhost:8080")
                                                                .description("Local Development")));
        }
}
