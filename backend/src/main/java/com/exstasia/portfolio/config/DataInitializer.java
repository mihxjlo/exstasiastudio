package com.exstasia.portfolio.config;

import com.exstasia.portfolio.entity.AdminUser;
import com.exstasia.portfolio.entity.Gallery;
import com.exstasia.portfolio.repository.AdminUserRepository;
import com.exstasia.portfolio.repository.GalleryRepository;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.io.File;

@Component
public class DataInitializer implements CommandLineRunner {

    private final AdminUserRepository adminUserRepository;
    private final GalleryRepository galleryRepository;
    private final PasswordEncoder passwordEncoder;

    @Value("${app.admin.email}")
    private String adminEmail;

    @Value("${app.admin.password}")
    private String adminPassword;

    @Value("${app.uploads.dir}")
    private String uploadsDir;

    public DataInitializer(
            AdminUserRepository adminUserRepository,
            GalleryRepository galleryRepository,
            PasswordEncoder passwordEncoder) {
        this.adminUserRepository = adminUserRepository;
        this.galleryRepository = galleryRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    public void run(String... args) throws Exception {
        // 1. Seed admin user if none exists
        if (adminUserRepository.findByEmail(adminEmail).isEmpty()) {
            AdminUser admin = AdminUser.builder()
                    .email(adminEmail)
                    .hashedPassword(passwordEncoder.encode(adminPassword))
                    .build();
            adminUserRepository.save(admin);
            System.out.println("Admin user seeded: " + adminEmail);
        }

        // 2. Seed galleries if none exist
        seedGallery("Portrait", "portrait", 0);
        seedGallery("Editorial", "editorial", 1);
        seedGallery("Campaign", "campaign", 2);
        seedGallery("Events", "events", 3);

        // 3. Ensure uploads folder exists
        File uploadFolder = new File(uploadsDir);
        if (!uploadFolder.exists()) {
            boolean created = uploadFolder.mkdirs();
            if (created) {
                System.out.println("Uploads directory created at: " + uploadsDir);
            } else {
                System.err.println("Failed to create uploads directory at: " + uploadsDir);
            }
        }
    }

    private void seedGallery(String title, String slug, int displayOrder) {
        if (galleryRepository.findBySlug(slug).isEmpty()) {
            Gallery gallery = Gallery.builder()
                    .title(title)
                    .slug(slug)
                    .displayOrder(displayOrder)
                    .build();
            galleryRepository.save(gallery);
            System.out.println("Seeded gallery: " + title + " (" + slug + ")");
        }
    }
}
