export default async (req, res) => {
  const user = req.object
  if (req.master) return res.success(user)

  // Set "username" to "email" on user creation
  if (user.isNew() && !req.master) {
    const email = user.get('email')
    user.set('username', email)
  }

  // Done
  return res.success(user)
}
