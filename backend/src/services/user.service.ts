import User from '../models/user.model';

export class UserService {
  static async createUser(data: { name: string; email: string; password: string }) {
    const user = new User(data);
    return await user.save();
  }

  static async findUserByEmail(email: string) {
    return await User.findOne({ email });
  }

  static async findUserById(id: string) {
    return await User.findById(id);
  }
} 