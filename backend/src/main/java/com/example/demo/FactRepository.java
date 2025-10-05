package com.example.demo;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

public interface FactRepository extends JpaRepository<Fact, Long> {

	Page<Fact> findByCategory_Name(String name, Pageable pageable);

	@Query(value = "SELECT * FROM facts f WHERE (:categoryId IS NULL OR f.category_id = :categoryId) ORDER BY random() LIMIT 1", nativeQuery = true)
	Fact findRandomByCategoryId(@Param("categoryId") Long categoryId);
}


