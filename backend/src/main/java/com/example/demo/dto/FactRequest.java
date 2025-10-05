package com.example.demo.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public class FactRequest {

	@NotBlank
	@Size(min = 3, max = 2000)
	private String fact;

	@NotBlank
	@Size(min = 1, max = 255)
	private String category;

	public String getFact() {
		return fact;
	}

	public void setFact(String fact) {
		this.fact = fact;
	}

	public String getCategory() {
		return category;
	}

	public void setCategory(String category) {
		this.category = category;
	}
}


