class TeamService {
  constructor(teamRepository, userRepository, actionService, io) {
    this.teamRepository = teamRepository;
    this.userRepository = userRepository;
    this.actionService = actionService;
    this.io = io;
  }

  async createTeam(userId, name, description) {
    const teamData = {
      name,
      description,
      createdBy: userId,
      members: [userId],
    };
    const newTeam = await this.teamRepository.createTeam(teamData);
    await this.actionService.logAndEmit(userId, null, "team_created", {
      teamId: newTeam._id,
    });
    this.io.emit("teamCreated", newTeam);
    return newTeam;
  }

  async inviteMember(teamId, inviterId, email) {
    const user = await this.userRepository.findUser({email: email});
    if (!user) {
      const err = new Error("User with this email doesn't exist");
      err.statusCode = 404;
      throw err;
    }

    const updatedTeam = await this.teamRepository.addMemberToTeam(
      teamId,
      user._id
    );

    await this.actionService.logAndEmit(inviterId, null, "member_invited", {
      invitedEmail: email,
    });
    this.io.emit("memberInvited", updatedTeam);

    return updatedTeam;
  }

  async removeMember(teamId, userId) {
    const updatedTeam = await this.teamRepository.removeMemberFromTeam(
      teamId,
      userId
    );
    this.io.emit("memberRemoved", updatedTeam);
    return updatedTeam;
  }

  async getTeamById(teamId) {
    return await this.teamRepository.getTeamById(teamId);
  }
}

export default TeamService;
