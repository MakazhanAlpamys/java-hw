package com.example.demo.dto;

public class FactResponse {
	private Long id;
	private String fact;
	private String category;

	public FactResponse() {}

	public FactResponse(Long id, String fact, String category) {
		this.id = id;
		this.fact = fact;
		this.category = category;
	}

	public Long getId() { return id; }
	public void setId(Long id) { this.id = id; }

	public String getFact() { return fact; }
	public void setFact(String fact) { this.fact = fact; }

	public String getCategory() { return category; }
	public void setCategory(String category) { this.category = category; }
}


