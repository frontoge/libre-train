export type Auth = {
	authToken?: string;
	user?: number;
	// True while the user is signed in with a temporary password they have not yet replaced.
	// Drives the set-password gate in RequireAuth.
	mustChangePassword?: boolean;
};
