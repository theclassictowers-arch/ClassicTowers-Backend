import { ROLES } from "#constants/index.js";
import { AbilityBuilder, createMongoAbility } from "@casl/ability";

export default function defineUserAbility(user) {
  const { can, cannot, build } = new AbilityBuilder(createMongoAbility);

  if (user.role === ROLES.ADMIN) {
    can("manage", "all");
  }
  if (user.role === ROLES.TEAM_LEAD) {
    can("manage", "User", {
      $or: { _id: user._id, teamLead: user._id },
    });
  }
  if (user.role === ROLES.OPERATOR) {
    can("read", "User", { _id: user._id });
    can("update", "User", { _id: user._id });
  }

  cannot("update", "User", {
    $or: { role: ROLES.ADMIN, isEmailVerified: false },
  });

  return build();
}
