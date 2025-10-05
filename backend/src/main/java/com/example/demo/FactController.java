package com.example.demo;

import java.util.List;

import org.springframework.data.domain.Page;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.example.demo.dto.FactRequest;
import com.example.demo.dto.FactResponse;

import jakarta.validation.Valid;

@RestController
@CrossOrigin(origins = {"http://localhost:5173"})
public class FactController {

	private final FactService factService;

	public FactController(FactService factService) {
		this.factService = factService;
	}

	@GetMapping("/api/categories")
	public List<Category> categories() {
		return factService.listCategories();
	}

	@GetMapping("/api/facts")
	public Page<FactResponse> listFacts(@RequestParam(required = false) String category,
			@RequestParam(defaultValue = "0") int page,
			@RequestParam(defaultValue = "20") int size) {
		return factService.list(category, page, size);
	}

	@GetMapping("/api/facts/random")
	public FactResponse randomFact(@RequestParam(required = false) String category) {
		return factService.random(category);
	}

	@PostMapping("/api/facts")
	public FactResponse create(@Valid @RequestBody FactRequest request) {
		return factService.create(request);
	}

	@PutMapping("/api/facts/{id}")
	public FactResponse update(@PathVariable Long id, @Valid @RequestBody FactRequest request) {
		return factService.update(id, request);
	}

	@DeleteMapping("/api/facts/{id}")
	public void delete(@PathVariable Long id) {
		factService.delete(id);
	}
}


