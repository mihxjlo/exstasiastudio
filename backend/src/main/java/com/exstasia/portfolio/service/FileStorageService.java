package com.exstasia.portfolio.service;

import com.exstasia.portfolio.exception.InvalidFileTypeException;
import com.exstasia.portfolio.exception.ResourceNotFoundException;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import javax.imageio.ImageIO;
import javax.imageio.ImageReader;
import javax.imageio.stream.ImageInputStream;
import java.io.IOException;
import java.io.InputStream;
import java.net.MalformedURLException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.Iterator;
import java.util.Locale;
import java.util.Map;
import java.util.UUID;

@Service
public class FileStorageService {

    /**
     * Image formats we accept, mapped to the extension we store them under.
     * The key is the format name reported by the ImageIO reader that claimed the
     * file, which is decided by the file's magic bytes — not by its name or by the
     * client-supplied Content-Type, both of which the uploader controls.
     */
    private static final Map<String, ImageType> ALLOWED_FORMATS = Map.of(
            "jpeg", new ImageType(".jpg", "image/jpeg"),
            "png", new ImageType(".png", "image/png")
    );

    private record ImageType(String extension, String contentType) {
    }

    /**
     * A validated, stored image: its generated filename, the content type detected
     * from the file itself, and its pixel dimensions.
     */
    public record StoredImage(String fileName, String contentType, int width, int height) {
    }

    private record ImageInfo(ImageType type, int width, int height) {
    }

    private final Path fileStorageLocation;

    public FileStorageService(@Value("${app.uploads.dir}") String uploadsDir) {
        this.fileStorageLocation = Paths.get(uploadsDir).toAbsolutePath().normalize();
        try {
            Files.createDirectories(this.fileStorageLocation);
        } catch (IOException ex) {
            throw new RuntimeException("Could not create the directory where the uploaded files will be stored.", ex);
        }
    }

    public StoredImage storeFile(MultipartFile file) throws IOException {
        // Inspect before anything touches the disk, so a rejected upload leaves no trace.
        ImageInfo info = inspectImage(file);
        String fileName = UUID.randomUUID().toString() + info.type().extension();
        Path targetLocation = resolveWithinStorage(fileName);
        Files.copy(file.getInputStream(), targetLocation);
        return new StoredImage(fileName, info.type().contentType(), info.width(), info.height());
    }

    public Resource loadFileAsResource(String fileName) {
        try {
            Path filePath = resolveWithinStorage(fileName);
            Resource resource = new UrlResource(filePath.toUri());
            if (resource.exists() && resource.isReadable()) {
                return resource;
            }
            throw new ResourceNotFoundException("File not found: " + fileName);
        } catch (MalformedURLException ex) {
            throw new ResourceNotFoundException("File not found: " + fileName);
        }
    }

    public void deleteFile(String fileName) {
        try {
            Files.deleteIfExists(resolveWithinStorage(fileName));
        } catch (IOException ex) {
            System.err.println("Could not delete file " + fileName + ": " + ex.getMessage());
        }
    }

    /**
     * Determines the real image format and dimensions from the file's content.
     * Anything that is not a readable JPEG or PNG is rejected.
     *
     * <p>The stored extension comes from here rather than from the uploaded
     * filename: {@code FileController} derives the response Content-Type from the
     * extension and serves files inline, so honouring a caller-supplied extension
     * would let an uploader have a file served back as e.g. {@code text/html} and
     * execute scripts on this origin.
     *
     * <p>Dimensions are read from the image header in this same pass, which spares
     * callers a second read of the upload and avoids decoding the full bitmap.
     */
    private ImageInfo inspectImage(MultipartFile file) throws IOException {
        try (InputStream in = file.getInputStream();
             ImageInputStream imageStream = ImageIO.createImageInputStream(in)) {

            if (imageStream == null) {
                throw new InvalidFileTypeException("Uploaded file could not be read.");
            }

            Iterator<ImageReader> readers = ImageIO.getImageReaders(imageStream);
            if (!readers.hasNext()) {
                throw new InvalidFileTypeException(
                        "Unsupported file type. Only JPEG and PNG images are allowed.");
            }

            ImageReader reader = readers.next();
            try {
                String format = reader.getFormatName().toLowerCase(Locale.ROOT);
                ImageType type = ALLOWED_FORMATS.get(format);
                if (type == null) {
                    throw new InvalidFileTypeException(
                            "Unsupported image format. Only JPEG and PNG images are allowed.");
                }

                reader.setInput(imageStream);
                try {
                    return new ImageInfo(type, reader.getWidth(0), reader.getHeight(0));
                } catch (IOException ex) {
                    throw new InvalidFileTypeException("Image file is corrupt or unreadable.");
                }
            } finally {
                reader.dispose();
            }
        }
    }

    /**
     * Resolves a stored filename against the uploads directory and confirms the
     * result has not escaped it, so a crafted name cannot reach unrelated files.
     */
    private Path resolveWithinStorage(String fileName) {
        Path resolved = this.fileStorageLocation.resolve(fileName).normalize();
        if (!resolved.startsWith(this.fileStorageLocation)) {
            throw new ResourceNotFoundException("File not found: " + fileName);
        }
        return resolved;
    }
}
