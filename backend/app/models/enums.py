from enum import Enum

class Platform(str, Enum):
    AMAZON = "amazon"
    EBAY = "ebay"
    SHOPIFY = "shopify"
    WALMART = "walmart"

class ProductStatus(str, Enum):
    ACTIVE = "active"
    INACTIVE = "inactive"
    OUT_OF_STOCK = "out_of_stock"
