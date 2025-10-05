package com.example.demo;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;

import java.util.Optional;

import org.junit.jupiter.api.Test;
import org.mockito.Mockito;

import com.example.demo.dto.FactRequest;

public class FactServiceTest {

	@Test
	void create_shouldPersistWithNewCategory() {
		FactRepository factRepo = Mockito.mock(FactRepository.class);
		CategoryRepository catRepo = Mockito.mock(CategoryRepository.class);
		FactService service = new FactService(factRepo, catRepo);

		when(catRepo.findByName("книги")).thenReturn(Optional.empty());
		when(catRepo.save(any(Category.class))).thenAnswer(inv -> {
			Category c = inv.getArgument(0);
			c.setId(1L);
			return c;
		});
		when(factRepo.save(any(Fact.class))).thenAnswer(inv -> {
			Fact f = inv.getArgument(0);
			f.setId(42L);
			return f;
		});

		FactRequest req = new FactRequest();
		req.setFact("Новый факт");
		req.setCategory("книги");

		var resp = service.create(req);

		assertThat(resp.getId()).isEqualTo(42L);
		assertThat(resp.getCategory()).isEqualTo("книги");
	}
}


