import { Elysia, t } from 'elysia'

export const testRoute = new Elysia()
    .guard({
        beforeHandle: [
            ({query: {name}, status})=>{
                if(!name) return status(401)
            },
            ({query: {name}})=>{
                console.log(name)
            }
        ],
        afterResponse({responseValue}){
            console.log(responseValue)
        },
        query: t.Object({
            name: t.String()
        })
    })
    .get('/hello', ({ query: { name } }) => {
        return { message: `Hello, ${name}` }
    })


