import React from "react"
import { Box, Button, Card, Heading, Text } from "rebass"

const ProductPrice = ({ product, total, isFeatured }) => {
  const url = product.coupon
    ? `https://gumroad.com/l/${product.gumroadID}/${product.coupon}?wanted=true`
    : `https://gumroad.com/l/${product.gumroadID}?wanted=true`

  return (
    <Card
      width={[1, 1 / total, 1 / total]}
      textAlign="center"
      sx={{
        display: "inline-block",
      }}
      py={isFeatured ? 30 : 0}
      px={isFeatured ? 10 : 0}
      minWidth={160}
      my={2}
    >
      <Heading fontSize={[4, 4, 5]} py={3} px={1}>
        {product.name}
      </Heading>
      <Box py={2}>
        US${" "}
        <Text display="inline" mt={5} fontWeight="bold" fontSize={[20, 30]}>
          {product.price}
        </Text>
      </Box>
      <Button
        as="a"
        href={url}
        data-gumroad-product-id={product.gumroadID}
        data-gumroad-single-product="true"
        mx={2}
        bg={isFeatured ? "primary" : "transparent"}
        color={isFeatured ? "background" : "secondary"}
        sx={{
          border: "solid 1px",
          ":hover": {
            cursor: "pointer",
          },
        }}
      >
        {product.cta}
      </Button>
      <Box textAlign="center" mt={50} pb={10} fontSize={[2, 3, 3]}>
        {product.features.map((feature, index) => (
          <Text pl={3} key={index}>
            {" "}
            {feature}
          </Text>
        ))}
      </Box>
    </Card>
  )
}

const Pricing = ({ products }) => (
  <Box>
    {products.map((product, index) => (
      <ProductPrice
        key={product.name}
        product={product}
        total={products.length}
        isFeatured={index === 1}
      />
    ))}
  </Box>
)

export default Pricing
