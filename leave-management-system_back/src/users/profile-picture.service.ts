import { Injectable, BadRequestException, Logger } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import * as fs from 'fs';
import * as path from 'path';

// ✅ Type for TypeORM UPDATE query result
interface UpdateResult {
  affectedRows?: number;
  [key: string]: unknown;
}

@Injectable()
export class ProfilePictureService {
  private readonly logger = new Logger(ProfilePictureService.name);

  constructor(@InjectDataSource() private dataSource: DataSource) {}

  async uploadProfilePicture(
    userId: string,
    file: Express.Multer.File,
  ): Promise<string> {
    try {
      // ✅ SECURITY: Validate file before processing
      this.validateFile(file);

      // Create uploads directory if it doesn't exist
      const uploadsDir = path.join(process.cwd(), 'uploads', 'profile_pics');
      if (!fs.existsSync(uploadsDir)) {
        fs.mkdirSync(uploadsDir, { recursive: true });
      }

      // ✅ SECURITY: Use validated file extension from mime type, not original filename
      const fileExtension = this.getExtensionFromMimeType(file.mimetype);

      // Create new filename: user_<id>.<ext>
      const fileName = `user_${userId}.${fileExtension}`;
      const filePath = path.join(uploadsDir, fileName);

      // Write file to disk
      fs.writeFileSync(filePath, file.buffer);

      // Create the URL path for accessing the file
      const profilePicUrl = `/uploads/profile_pics/${fileName}`;

      // ✅ DATABASE: Update user's profile picture URL with proper typing
      const result = await this.dataSource.query<UpdateResult[] | UpdateResult>(
        'UPDATE users SET profile_picture_url = $1 WHERE id = $2',
        [profilePicUrl, userId],
      );

      // Get affected rows count
      const affectedRows = this.getAffectedRows(result);

      // Check if user was found and updated
      if (affectedRows === 0) {
        // Clean up the uploaded file if user doesn't exist
        if (fs.existsSync(filePath)) {
          fs.unlinkSync(filePath);
        }
        throw new BadRequestException(`User with ID ${userId} not found`);
      }

      this.logger.log(
        `Profile picture uploaded successfully for user: ${userId}`,
      );

      return profilePicUrl;
    } catch (error) {
      this.logger.error(
        `Error uploading profile picture for user ${userId}: ${error instanceof Error ? error.message : 'Unknown error'}`,
      );
      throw error;
    }
  }

  // ✅ SECURITY: Comprehensive file validation
  private validateFile(file: Express.Multer.File): void {
    // 1. Check file size (5MB max)
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      throw new BadRequestException('File size exceeds 5MB limit');
    }

    // 2. Validate mime type
    const allowedMimeTypes = [
      'image/jpeg',
      'image/jpg',
      'image/png',
      'image/webp',
      'image/gif',
    ];

    if (!allowedMimeTypes.includes(file.mimetype)) {
      throw new BadRequestException(
        'Invalid file type. Only JPEG, PNG, WEBP, and GIF images are allowed',
      );
    }

    // 3. Validate file has content
    if (!file.buffer || file.buffer.length === 0) {
      throw new BadRequestException('File is empty');
    }

    // 4. Basic magic number validation (check file signature)
    this.validateFileSignature(file.buffer, file.mimetype);
  }

  // ✅ SECURITY: Validate file signature (magic numbers)
  private validateFileSignature(buffer: Buffer, mimetype: string): void {
    if (buffer.length < 4) {
      throw new BadRequestException('File is too small to be a valid image');
    }

    const signatures: Record<string, number[][]> = {
      'image/jpeg': [[0xff, 0xd8, 0xff]],
      'image/jpg': [[0xff, 0xd8, 0xff]],
      'image/png': [[0x89, 0x50, 0x4e, 0x47]],
      'image/gif': [[0x47, 0x49, 0x46]],
      'image/webp': [[0x52, 0x49, 0x46, 0x46]], // RIFF (WebP container)
    };

    const expectedSignatures = signatures[mimetype];
    if (!expectedSignatures) {
      return; // Unknown mime type, skip signature check
    }

    const fileSignature = Array.from(buffer.slice(0, 4));
    const isValid = expectedSignatures.some((signature) =>
      signature.every((byte, index) => fileSignature[index] === byte),
    );

    if (!isValid) {
      throw new BadRequestException(
        'File content does not match the declared file type. Possible file tampering detected.',
      );
    }
  }

  // ✅ SECURITY: Get safe file extension from mime type
  private getExtensionFromMimeType(mimetype: string): string {
    const mimeToExt: Record<string, string> = {
      'image/jpeg': 'jpg',
      'image/jpg': 'jpg',
      'image/png': 'png',
      'image/webp': 'webp',
      'image/gif': 'gif',
    };

    const ext = mimeToExt[mimetype];
    if (!ext) {
      throw new BadRequestException('Unsupported file type');
    }

    return ext;
  }

  // ✅ Helper to extract affected rows from different TypeORM result formats
  private getAffectedRows(
    result: UpdateResult[] | UpdateResult | number,
  ): number {
    // TypeORM can return results in different formats depending on the database driver:
    // 1. Array format: [[], affectedRows] - PostgreSQL often returns this
    // 2. Object format: {affectedRows: n} - Some drivers return this
    // 3. Just a number - Simplified format

    if (Array.isArray(result)) {
      // PostgreSQL format: [[], affectedRows]
      if (result.length > 1 && typeof result[1] === 'number') {
        return result[1];
      }
      return 0;
    } else if (typeof result === 'object' && result !== null) {
      // Object format: {affectedRows: n}
      if ('affectedRows' in result && typeof result.affectedRows === 'number') {
        return result.affectedRows;
      }
      return 0;
    } else if (typeof result === 'number') {
      // Direct number format
      return result;
    }

    return 0;
  }

  // ✅ Static validation method for use in controllers (renamed from validateFileStatic)
  static validateFile(file: Express.Multer.File): boolean {
    const allowedMimeTypes = [
      'image/jpeg',
      'image/jpg',
      'image/png',
      'image/webp',
      'image/gif',
    ];
    const maxSize = 5 * 1024 * 1024; // 5MB

    return allowedMimeTypes.includes(file.mimetype) && file.size <= maxSize;
  }
}
