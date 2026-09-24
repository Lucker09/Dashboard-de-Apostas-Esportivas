package com.dashboard.bets_dashboard;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.data.web.config.EnableSpringDataWebSupport;

@SpringBootApplication
@EnableSpringDataWebSupport(pageSerializationMode = EnableSpringDataWebSupport.PageSerializationMode.VIA_DTO)
public class BetsDashboardApplication {

	public static void main(String[] args) {
		SpringApplication.run(BetsDashboardApplication.class, args);
	}
}