package com.exstasia.portfolio.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "hero_image")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class HeroImage {

    @Id
    private Long id;

    @Column(name = "file_path", length = 500)
    private String filePath;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;
}
