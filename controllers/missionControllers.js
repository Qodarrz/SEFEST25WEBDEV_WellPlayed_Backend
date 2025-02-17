const Mission = require("../models/Mission");
const UserMission = require("../models/UserMission");

const getMissions = async (req, res) => {
  try {
    const missions = await Mission.findAll({
      order: [["id", "ASC"]],
    });

    // Format response yang lebih lengkap
    const formattedMissions = missions.map(mission => ({
      id: mission.id,
      name: mission.name,
      description: mission.description,
      target_kgco2: mission.target_kgco2,
      points: mission.points,
      created_at: mission.created_at,
      updated_at: mission.updated_at
    }));

    res.status(200).json({
      message: "Daftar misi berhasil diambil!",
      missions: formattedMissions,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const takeMission = async (req, res) => {
  try {
    const { missionId } = req.body;
    const userId = req.user.id;

    // Validasi missionId
    if (!missionId) {
      return res.status(400).json({ message: "Mission ID harus disediakan!" });
    }

    // Cek apakah misi dengan missionId tersebut ada
    const mission = await Mission.findByPk(missionId);
    if (!mission) {
      return res.status(404).json({ message: "Misi tidak ditemukan!" });
    }

    // Cek apakah user sudah memiliki misi aktif (status 'pending')
    const activeMission = await UserMission.findOne({
      where: { user_id: userId, status: "pending" },
    });
    if (activeMission) {
      return res.status(400).json({
        message: "Anda sudah memiliki misi aktif. Selesaikan misi tersebut terlebih dahulu.",
      });
    }

    // Buat record baru di tabel UserMission
    const newUserMission = await UserMission.create({
      user_id: userId,
      mission_id: missionId,
      date_taken: new Date(),
      status: "pending",
    });

    res.status(201).json({
      message: `Misi "${mission.name}" berhasil diambil!`,
      userMission: newUserMission,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getMissions,
  takeMission,
};
