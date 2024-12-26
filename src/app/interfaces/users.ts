export interface User {
    id?: number;           // Optional for new users, present when receiving from server
    fullName: string;
    email: string;
    phoneNumber: string;
    dateOfBirth: string;   // Using string since it comes from an input type="date"
    role: UserRole;        // Using enum for type safety
    company: string;
    password?: string;     // Optional because it won't be returned from server
    createdAt?: string;    // Optional server-generated timestamp
    updatedAt?: string;    // Optional server-generated timestamp
    isActive?: boolean;    // Optional status flag
}

// Enum for user roles to ensure type safety
export enum UserRole {
    ADMIN = 'Admin',
    MANAGER = 'Manager',
    USER = 'User'
}

// Interface for creating a new user (omits server-generated fields)
export interface CreateUserDto {
    fullName: string;
    email: string;
    phoneNumber: string;
    dateOfBirth: string;
    role: UserRole;
    company: string;
    password: string;
}

// Interface for updating a user (all fields optional)
export interface UpdateUserDto {
    fullName?: string;
    email?: string;
    phoneNumber?: string;
    dateOfBirth?: string;
    role?: UserRole;
    company?: string;
    password?: string;
    isActive?: boolean;
}