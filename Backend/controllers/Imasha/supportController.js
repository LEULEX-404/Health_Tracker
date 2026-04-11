import SupportMessage from '../../models/Imasha/SupportMessage.js';

export const createSupportMessage = async (req, res, next) => {
  try {
    const { subject, message } = req.body || {};

    if (!subject?.trim() || !message?.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Subject and message are required.',
      });
    }

    const doctorName = [req.user?.firstName, req.user?.lastName].filter(Boolean).join(' ').trim() || 'Doctor';
    const supportMessage = await SupportMessage.create({
      doctorUserId: req.user._id,
      doctorName: `Dr. ${doctorName}`.replace('Dr. Dr. ', 'Dr. '),
      doctorEmail: req.user.email,
      subject: subject.trim(),
      message: message.trim(),
      status: 'Open',
    });

    res.status(201).json({
      success: true,
      message: 'Support message sent successfully.',
      data: supportMessage,
    });
  } catch (error) {
    next(error);
  }
};

export const getMySupportMessages = async (req, res, next) => {
  try {
    const messages = await SupportMessage.find({ doctorUserId: req.user._id })
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      data: messages,
    });
  } catch (error) {
    next(error);
  }
};

export const getAllSupportMessages = async (req, res, next) => {
  try {
    const messages = await SupportMessage.find()
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      data: messages,
    });
  } catch (error) {
    next(error);
  }
};

export const updateSupportMessageStatus = async (req, res, next) => {
  try {
    const { status, adminNote } = req.body || {};

    if (status && !['Open', 'Resolved'].includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid status.',
      });
    }

    const supportMessage = await SupportMessage.findByIdAndUpdate(
      req.params.id,
      {
        ...(status ? { status } : {}),
        ...(adminNote !== undefined ? { adminNote: adminNote.trim() } : {}),
      },
      { new: true, runValidators: true }
    );

    if (!supportMessage) {
      return res.status(404).json({
        success: false,
        message: 'Support message not found.',
      });
    }

    res.status(200).json({
      success: true,
      message: 'Support message updated successfully.',
      data: supportMessage,
    });
  } catch (error) {
    next(error);
  }
};
