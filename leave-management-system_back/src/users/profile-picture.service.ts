import { Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class ProfilePictureService {
  constructor(@InjectDataSource() private dataSource: DataSource) {}

  async uploadProfilePicture(
    userId: string,
    file: Express.Multer.File,
  ): Promise<string> {
    try {
      // Create uploads directory if it doesn't exist
      const uploadsDir = path.join(process.cwd(), 'uploads', 'profile_pics');
      if (!fs.existsSync(uploadsDir)) {
        fs.mkdirSync(uploadsDir, { recursive: true });
      }

      // Get file extension
      const fileExtension = path.extname(file.originalname).toLowerCase();

      // Create new filename: user_<id>.<ext>
      const fileName = `user_${userId}${fileExtension}`;
      const filePath = path.join(uploadsDir, fileName);

      // Write file to disk
      fs.writeFileSync(filePath, file.buffer);

      // Create the URL path for accessing the file
      const profilePicUrl = `/uploads/profile_pics/${fileName}`;

      // Update user's profile_pic_url in database using raw SQL
      const query = 'UPDATE users SET profile_picture_url = $1 WHERE id = $2';
      const result = await this.dataSource.query(query, [
        profilePicUrl,
        userId,
      ]);

      console.log('🔍 Database update result:', result);

      // TypeORM's raw query for UPDATE returns an array where:
      // result[0] = result data (empty for UPDATE)
      // result[1] = affected rows count (for PostgreSQL UPDATE queries)
      let affectedRows = 0;

      // Different ways TypeORM might return the affected rows
      if (Array.isArray(result) && result.length > 1) {
        affectedRows = result[1]; // Some versions return [[], affectedRows]
      } else if (
        result &&
        typeof result === 'object' &&
        'affectedRows' in result
      ) {
        affectedRows = result.affectedRows; // Some versions return {affectedRows: n}
      } else if (typeof result === 'number') {
        affectedRows = result; // Some versions return just the number
      }

      console.log('🔍 Affected rows:', affectedRows);

      // Check if user was found and updated
      if (affectedRows === 0) {
        // Clean up the uploaded file if user doesn't exist
        if (fs.existsSync(filePath)) {
          fs.unlinkSync(filePath);
        }
        throw new Error(`User with ID ${userId} not found`);
      }

      console.log(
        `✅ Profile picture uploaded for user ${userId}: ${profilePicUrl}`,
      );

      // Verify the update worked by querying the user
      const verifyQuery = 'SELECT profile_picture_url FROM users WHERE id = $1';
      const verifyResult = await this.dataSource.query(verifyQuery, [userId]);
      console.log('🔍 Verification result:', verifyResult);

      if (verifyResult && verifyResult.length > 0) {
        console.log(
          '✅ Database updated successfully. New profile_picture_url:',
          verifyResult[0].profile_picture_url,
        );
      } else {
        console.log('❌ User not found during verification');
      }

      return profilePicUrl;
    } catch (error) {
      console.error('❌ Error uploading profile picture:', error);
      throw error;
    }
  }

  // Validate file type and size
  static validateFile(file: Express.Multer.File): boolean {
    const allowedMimeTypes = [
      'image/jpeg',
      'image/jpg',
      'image/png',
      'image/webp',
    ];
    const maxSize = 5 * 1024 * 1024; // 5MB

    return allowedMimeTypes.includes(file.mimetype) && file.size <= maxSize;
  }
}
