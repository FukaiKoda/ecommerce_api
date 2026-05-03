export default class userController {

    constructor(userService) {
        this.userService = userService
    }

    ChangeUserRole = async (req, res, next) => {
        
        const { role, id } = req.params
        
        try {
            const user = await this.userService.ChangeUserRole(parseInt(id), role)
            req.session.userRole = role
            res.status(200).json(user)
        }
        catch (error) {
            next(error)
        }
    }
}