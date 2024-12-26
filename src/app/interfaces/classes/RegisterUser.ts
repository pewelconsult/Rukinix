export class User {
    firstName: string
    lastName: string
    phone: string
    dateOfBirth: Date|null
    address: string
    email: string
    password: any
    confirmPassword:any
    acceptTerms: boolean


    constructor () {
        this.firstName = ""
        this.lastName = ""
        this.phone = ""
        this.dateOfBirth = null
        this.address = ""
        this.email = ""
        this.password = ""
        this.confirmPassword=""
        this.acceptTerms=false
    }
}