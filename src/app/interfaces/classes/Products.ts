export class Product {
    itemName: string
    itemCode: string
    category: string
    brand: string
    quantity: number
    size: string
    costPrice: number
    sellingPrice:number
    reorderLevel: number
    supplierName:string


    constructor () {
        this.itemName = ""
        this.itemCode = ""
        this.category = ""
        this.brand = ""
        this.quantity = 0
        this.size = ""
        this.costPrice = 0
        this.sellingPrice=0
        this.supplierName=""
        this.reorderLevel=0
    }
}