const { PrismaClient } = require('@prisma/client');
const cities = require('./cities.ts');
const { descriptors, places } = require('./seedHelper.ts');
// const cities = require('./cities');
const prisma = new PrismaClient();

async function main() {
  // await  prisma.campgroundschema.deleteMany()
  // const camp = await prisma.campgroundschema.create({data:{title:'ammane',price:'33',description:'love',location:'amman'}})
  // console.log(camp);
  console.log('Database connected');
}

// main()
//     .catch( e =>{
//       console.log(e.message);
//     })
//     .finally(async () =>{
//       await prisma.$disconnect()
//     });

const sample = (array) => array[Math.floor(Math.random() * array.length)];

const seedDB = async () => {
  await prisma.conferenceschema.deleteMany();
  for (let i = 1; i <= 50; i++) {
    const random1000 = Math.floor(Math.random() * 1000);
    const price = Math.floor(Math.random() * 20) + 10;
    const camp = await prisma.conferenceschema.create({
      data: {
        location: `${cities[random1000].city},
        ${cities[random1000].state}`,
        title: `${sample(descriptors)} ${sample(places)}`,
        authors: { connect: { id: 1 } },
        image: 'https://source.unsplash.com/collection/483251',
        description:
          'Lorem ipsum dolor sit amet consectetur adipisicing elit. Facilis, suscipit? Cumque enim rerum aperiam, est quis tempore perferendis illo rem veniam? Quas id aperiam alias veritatis ut quis voluptatem rerum.',
        price: price,
      },
    });
    console.log(camp);
  }

  // const camp = await prisma.campgroundschema.create({data:{title:'purple filed'}})
};

seedDB();
