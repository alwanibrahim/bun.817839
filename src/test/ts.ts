type Santai= {
  name: string
  age: number
}

type User = {
  status: boolean
  warga: Santai[]
}

const user: User = {
  status: true,
  warga: [
    {
      name: "alwan", 
      age: 7218
    }
  ]
}

console.log(typeof user.warga[0].name)