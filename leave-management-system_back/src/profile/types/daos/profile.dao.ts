import { Gender } from '../enums/gender.enum';

export class ProfileDao {
  id: number;
  userId: number;
  // user?: UserDao;
  employeeId: string;
  department: string;
  designation: string;
  joinDate: Date;
  gender: Gender;
  dateOfBirth?: Date;
  phone?: string;
  emergencyContact?: string;
  currentAddress?: string;
  workExperience: number;
  idProofType?: string;
  idProofNumber?: string;
  profilePicture?: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;

  constructor(partial: Partial<ProfileDao>) {
    Object.assign(this, partial);
  }

  get age(): number | null {
    if (!this.dateOfBirth) return null;
    const today = new Date();
    const birthDate = new Date(this.dateOfBirth);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();

    if (
      monthDiff < 0 ||
      (monthDiff === 0 && today.getDate() < birthDate.getDate())
    ) {
      age--;
    }

    return age;
  }

  get yearsOfService(): number {
    const today = new Date();
    const joinDate = new Date(this.joinDate);
    return Math.floor(
      (today.getTime() - joinDate.getTime()) / (1000 * 60 * 60 * 24 * 365),
    );
  }

  get contactInfo() {
    return {
      // email: this.user?.email,
      phone: this.phone,
      emergencyContact: this.emergencyContact,
      currentAddress: this.currentAddress,
    };
  }

  toEmployeeInfo() {
    return {
      department: this.department,
      designation: this.designation,
      joinDate: this.joinDate,
      employeeId: this.employeeId,
      workExperience: this.workExperience,
      gender: this.gender,
      idProof: this.idProofType ? `${this.idProofType}` : null,
    };
  }
}
