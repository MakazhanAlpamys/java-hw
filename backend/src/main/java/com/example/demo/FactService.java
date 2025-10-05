package com.example.demo;

import java.util.List;
import java.util.Optional;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.example.demo.dto.FactRequest;
import com.example.demo.dto.FactResponse;

@Service
public class FactService {

	private final FactRepository factRepository;
	private final CategoryRepository categoryRepository;

	public FactService(FactRepository factRepository, CategoryRepository categoryRepository) {
		this.factRepository = factRepository;
		this.categoryRepository = categoryRepository;
	}

	@Transactional(readOnly = true)
	public Page<FactResponse> list(String category, int page, int size) {
		Pageable pageable = PageRequest.of(page, size);
		Page<Fact> factsPage;
		if (category != null && !category.isBlank()) {
			factsPage = factRepository.findByCategory_Name(category, pageable);
		} else {
			factsPage = factRepository.findAll(pageable);
		}
		List<FactResponse> mapped = factsPage.getContent().stream()
				.map(f -> new FactResponse(f.getId(), f.getFact(), f.getCategory() != null ? f.getCategory().getName() : null))
				.toList();
		return new PageImpl<>(mapped, pageable, factsPage.getTotalElements());
	}

	@Transactional(readOnly = true)
	public FactResponse random(String category) {
		Long categoryId = null;
		if (category != null && !category.isBlank()) {
			Optional<Category> cat = categoryRepository.findByName(category);
			categoryId = cat.map(Category::getId).orElse(null);
		}
		Fact f = factRepository.findRandomByCategoryId(categoryId);
		if (f == null) return null;
		return new FactResponse(f.getId(), f.getFact(), f.getCategory() != null ? f.getCategory().getName() : null);
	}

	@Transactional
	public FactResponse create(FactRequest request) {
		Category cat = categoryRepository.findByName(request.getCategory())
				.orElseGet(() -> {
					Category c = new Category();
					c.setName(request.getCategory());
					return categoryRepository.save(c);
				});
		Fact f = new Fact();
		f.setFact(request.getFact());
		f.setCategory(cat);
		Fact saved = factRepository.save(f);
		return new FactResponse(saved.getId(), saved.getFact(), cat.getName());
	}

	@Transactional
	public FactResponse update(Long id, FactRequest request) {
		Fact f = factRepository.findById(id).orElseThrow();
		f.setFact(request.getFact());
		Category cat = categoryRepository.findByName(request.getCategory())
				.orElseGet(() -> {
					Category c = new Category();
					c.setName(request.getCategory());
					return categoryRepository.save(c);
				});
		f.setCategory(cat);
		Fact saved = factRepository.save(f);
		return new FactResponse(saved.getId(), saved.getFact(), cat.getName());
	}

	@Transactional
	public void delete(Long id) {
		factRepository.deleteById(id);
	}

	@Transactional(readOnly = true)
	public List<Category> listCategories() {
		return categoryRepository.findAll();
	}
}


