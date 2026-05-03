export default class AuthController {

    constructor(authService) {
        this.authService = authService
    }

    signUp = async (req, res, next) => {

        try {
            const { name, username, email, password } = req.body
            await this.authService.signUp({ name, username, email, password })
            res.status(201).json({ success: 'user was created successfuly' })
        }
        catch (error) {
            next(error)
        }
    }

    logIn = async (req, res, next) => {

        try {
            const { username, password } = req.body
            const user = await this.authService.logIn({ username, password })

            req.session.userId   = user.id
            req.session.userRole = user.role
            res.status(200).json({ success: 'user was authenticated successfully', role: user.role, userId: user.id })
        }
        catch (error) {
            next(error)
        }
    }

    tokenLogin = async (req, res, next) => {

        try {
            const {username, password} = req.body
            const user = await this.authService.logIn({ username, password })
            
            const jwt = this.authService.tokenLogin(user)
            res.status(200).json(jwt)
        }
        catch (error) {
            next(error)
        }
    }

    logOut = async (req, res, next) => {
        
        try {
            const { session } = req
            await this.authService.logOut(session)
            res.clearCookie('connect.sid')
            res.status(200).json({ success: 'Signed out successfuly' })
        }
        catch (error) {
            next(error)
        }
    }
}