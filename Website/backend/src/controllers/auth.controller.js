import User from '../models/user.model.js';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import config from '../config/index.js';
import sendEmail from '../utils/sendEmail.js'; // 👈 Import the email utility

// Helper function to generate a JWT
const generateToken = (id, identifier, role) => {
  // Use 'identifier' as generic field (mallId or companyId)
  return jwt.sign({ id, mallId: identifier, role }, config.jwtSecret, {
    expiresIn: '1d',
  });
};

// Controller for admin registration (Mall or Company)
const registerAdmin = async (req, res) => {
  const { mallId, companyId, password, recoveryEmail, role } = req.body;

  // Determine registration type based on inputs or role
  const isCompany = role === 'company' || !!companyId;
  const identifier = isCompany ? companyId : mallId;
  const identifierField = isCompany ? 'companyId' : 'mallId';
  const userRole = isCompany ? 'company' : 'admin';

  try {
    if (!identifier || !password) {
      return res.status(400).json({ message: `Please provide both ${isCompany ? 'Company ID' : 'Mall ID'} and a password.` });
    }

    // Check for existence
    const query = {};
    query[identifierField] = identifier;
    const userExists = await User.findOne(query);

    if (userExists) {
      return res.status(400).json({ message: `${isCompany ? 'Company ID' : 'Mall ID'} already exists.` });
    }

    if (recoveryEmail) {
      const emailExists = await User.findOne({ recoveryEmail });
      if (emailExists) {
        return res.status(400).json({ message: 'Recovery email is already in use.' });
      }
    }

    const userData = { password, recoveryEmail, role: userRole };
    userData[identifierField] = identifier;

    const user = await User.create(userData);
    const userObject = user.toObject();
    delete userObject.password;

    res.status(201).json({
      ...userObject,
      token: generateToken(user._id, identifier, user.role),
    });
  } catch (error) {
    console.error('🔥🔥 REGISTRATION ERROR 🔥🔥:', error);
    res.status(500).json({ message: 'Internal Server Error. Check server logs for details.' });
  }
};

// Controller for admin login (Mall or Company)
const loginAdmin = async (req, res) => {
  const { mallId, companyId, password } = req.body;

  const isCompany = !!companyId;
  const identifier = isCompany ? companyId : mallId;
  const identifierField = isCompany ? 'companyId' : 'mallId';

  try {
    if (!identifier) {
        return res.status(400).json({ message: `Please provide ${isCompany ? 'Company ID' : 'Mall ID'}` });
    }

    const query = {};
    query[identifierField] = identifier;
    const user = await User.findOne(query);

    if (user && (await user.matchPassword(password))) {
      const userObject = user.toObject();
      delete userObject.password;
      res.json({
        ...userObject,
        token: generateToken(user._id, identifier, user.role),
      });
    } else {
      res.status(401).json({ message: `Invalid ${isCompany ? 'Company ID' : 'Mall ID'} or password` });
    }
  } catch (error) {
    console.error('LOGIN ERROR:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

const createMallUnderCompany = async (req, res) => {
    const { mallId, password, recoveryEmail, mallName, location } = req.body;

    if (req.user.role !== 'company') {
        return res.status(403).json({ message: 'Only companies can perform this action' });
    }

    try {
        const userExists = await User.findOne({ mallId });
        if (userExists) {
          return res.status(400).json({ message: 'Mall ID already exists.' });
        }

        const newMall = await User.create({
            mallId,
            password,
            recoveryEmail,
            mallName,
            location,
            role: 'admin', // Standard mall admin
            parentCompanyId: req.user._id
        });

        const userObject = newMall.toObject();
        delete userObject.password;
        res.status(201).json(userObject);

    } catch (error) {
        console.error('Create Mall Error:', error);
        res.status(500).json({ message: 'Server error creating mall' });
    }
};

// Get Malls for the logged in company
const getCompanyMalls = async (req, res) => {
    if (req.user.role !== 'company') {
        return res.status(403).json({ message: 'Only companies can perform this action' });
    }
    try {
        const malls = await User.find({ parentCompanyId: req.user._id }).select('-password');
        res.json(malls);
    } catch (error) {
        console.error('Get Malls Error:', error);
        res.status(500).json({ message: 'Server error fetching malls' });
    }
};

// Delete a mall under the logged in company
const deleteMallUnderCompany = async (req, res) => {
    if (req.user.role !== 'company') {
        return res.status(403).json({ message: 'Only companies can perform this action' });
    }
    const { id } = req.params;

    try {
        const mall = await User.findById(id);
        if (!mall) {
            return res.status(404).json({ message: 'Mall not found' });
        }
        if (mall.parentCompanyId.toString() !== req.user._id.toString()) {
            return res.status(401).json({ message: 'Unauthorized to delete this mall' });
        }

        // Delete the mall user
        await User.deleteOne({ _id: id });

        // Optionally: We could also delete all Carts and Products associated with this mallId here
        // for deeper cleanup, but sticking to removing the access for now.

        res.json({ message: 'Mall removed successfully' });
    } catch (error) {
        console.error('Delete Mall Error:', error);
        res.status(500).json({ message: 'Server error deleting mall' });
    }
};

// Controller for initiating a password reset
const forgotPassword = async (req, res) => {
  const { mallId } = req.body;
  try {
    const user = await User.findOne({ mallId });

    if (!user || !user.recoveryEmail) {
      // Security: Always send a success-like response to prevent guessing valid IDs.
      return res.status(200).json({ success: true, data: 'If an account with that email exists, a reset link has been sent.' });
    }

    const resetToken = user.getResetPasswordToken();
    await user.save({ validateBeforeSave: false });

    // Create reset URL that points to your frontend application
    const resetUrl = `http://localhost:5173/resetpassword/${resetToken}`;
    const message = `You are receiving this email because you (or someone else) has requested to reset the password for your SmartCart Central account.\n\nPlease click the link below, or paste it into your browser to complete the process:\n\n${resetUrl}\n\nIf you did not request this, please ignore this email.`;
    
    // Always log the reset URL to the console for development/fallback
    console.log('----------------------------------------------------');
    console.log('🔑 PASSWORD RESET URL:', resetUrl);
    console.log('----------------------------------------------------');

    try {
      await sendEmail({
        email: user.recoveryEmail,
        subject: 'SmartCart Central - Password Reset Request',
        message,
      });
      res.status(200).json({ success: true, data: 'Email sent successfully.' });
    } catch (err) {
      console.error('⚠️ Email sending failed, but token was generated.');
      console.error(err.message);
      // Do NOT clear the token. Allow the user to use the console link.
      // Return 200 so the frontend shows the "check console" message.
      res.status(200).json({ success: true, data: 'Email failed, but reset link logged to console.' });
    }
  } catch (error) {
    console.error('FORGOT PASSWORD ERROR:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Controller for resetting the password with a token
const resetPassword = async (req, res) => {
  try {
    const resetPasswordToken = crypto.createHash('sha256').update(req.params.resetToken).digest('hex');
    const user = await User.findOne({
      resetPasswordToken,
      resetPasswordExpire: { $gt: Date.now() },
    });

    if (!user) {
      return res.status(400).json({ message: 'Invalid or expired token' });
    }

    user.password = req.body.password;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;
    await user.save();
    
    const userObject = user.toObject();
    delete userObject.password;
    res.status(200).json({
      ...userObject,
      token: generateToken(user._id, user.mallId, user.role),
      message: 'Password reset successful',
    });
  } catch (error) {
    console.error('RESET PASSWORD ERROR:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

export { registerAdmin, loginAdmin, forgotPassword, resetPassword, createMallUnderCompany, getCompanyMalls, deleteMallUnderCompany };