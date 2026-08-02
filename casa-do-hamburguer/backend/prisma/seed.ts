import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Coloque as imagens correspondentes em: frontend/public/images/menu/
// usando os mesmos nomes de arquivo listados no campo "image" abaixo.

async function main() {
  await prisma.orderItem.deleteMany();
  await prisma.order.deleteMany();
  await prisma.product.deleteMany();

  const cardapio = [
    {
      name: 'Fúria do Chef',
      description: 'Blend 180g, queijo cheddar, bacon, molho especial da casa',
      price: 28.9,
      image: 'furia-do-chef.jpg',
      category: 'Hambúrgueres',
    },
    {
      name: 'Trovão Bacon',
      description: 'Blend 150g, bacon crocante, cebola caramelizada, queijo prato',
      price: 26.9,
      image: 'trovao-bacon.jpg',
      category: 'Hambúrgueres',
    },
    {
      name: 'Rebelde Verde',
      description: 'Hambúrguer artesanal, rúcula, tomate seco, molho pesto',
      price: 25.9,
      image: 'rebelde-verde.jpg',
      category: 'Hambúrgueres',
    },
    {
      name: 'Duplo Impacto',
      description: 'Dois blends 120g, queijo duplo, picles, molho barbecue',
      price: 33.9,
      image: 'duplo-impacto.jpg',
      category: 'Hambúrgueres',
    },
    {
      name: 'Clássico Real',
      description: 'Pão brioche, blend 150g, alface, tomate, maionese da casa',
      price: 22.9,
      image: 'classico-real.jpg',
      category: 'Hambúrgueres',
    },
    {
      name: 'Vulcão Picante',
      description: 'Blend 150g, geleia de pimenta, queijo pepper jack, jalapeño',
      price: 27.9,
      image: 'vulcao-picante.jpg',
      category: 'Hambúrgueres',
    },
    {
      name: 'Batata Rústica da Casa',
      description: 'Batata rústica temperada com alecrim',
      price: 16.9,
      image: 'batata-rustica.jpg',
      category: 'Acompanhamentos',
    },
    {
      name: 'Onion Rings Crocante',
      description: 'Anéis de cebola empanados e fritos',
      price: 15.9,
      image: 'onion-rings.jpg',
      category: 'Acompanhamentos',
    },
    {
      name: 'Nuggets Artesanais',
      description: '8 unidades de nuggets de frango artesanais',
      price: 17.9,
      image: 'nuggets.jpg',
      category: 'Acompanhamentos',
    },
    {
      name: 'Milkshake Trovão',
      description: 'Milkshake cremoso (chocolate, morango ou baunilha)',
      price: 15.9,
      image: 'milkshake-trovao.jpg',
      category: 'Bebidas',
    },
    {
      name: 'Suco Refresca Tudo',
      description: 'Suco natural (laranja ou limão)',
      price: 8.9,
      image: 'suco-natural.jpg',
      category: 'Bebidas',
    },
  ];

  for (const item of cardapio) {
    await prisma.product.create({ data: item });
  }

  console.log(`Cardápio populado com ${cardapio.length} itens!`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
