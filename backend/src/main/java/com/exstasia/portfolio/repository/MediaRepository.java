package com.exstasia.portfolio.repository;

import com.exstasia.portfolio.entity.Media;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface MediaRepository extends JpaRepository<Media, Long> {
    List<Media> findByGalleryIdOrderByRowGroupAscDisplayOrderAsc(Long galleryId);
    List<Media> findByGalleryId(Long galleryId);
}
