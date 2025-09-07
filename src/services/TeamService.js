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
      teamName: name,
    });
    this.io.emit("teamCreated", newTeam);
    return newTeam;
  }

  async inviteMember(teamId, inviterId, email) {
    const team = await this.teamRepository.getTeamById(teamId);
    if (!team) {
      const err = new Error("Team not found");
      err.statusCode = 404;
      throw err;
    }

    if (team.createdBy.toString() !== inviterId.toString()) {
      const err = new Error("You are not authorized to invite members to this team.");
      err.statusCode = 403;
      throw err;
    }

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

  async getTeamById(teamId, userId) {
    const team = await this.teamRepository.getTeamById(teamId);
    if (!team) {
      const error = new Error("Team not found");
      error.statusCode = 404;
      throw error;
    }

    // Check if the user is a member of the team
    const isMember = team.members.some(member => member._id.toString() === userId.toString());
    if (!isMember) {
      const error = new Error("You are not authorized to view this team.");
      error.statusCode = 403;
      throw error;
    }

    return team;
  }
}

export default TeamService;