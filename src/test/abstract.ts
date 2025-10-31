export type Conditional = {
    left?: number; // optional, karena bisa ambil dari node sebelumnya
    operator: string;
    right: number;
}

interface Wadah<TData = any> {
    data: TData;
    [key: string]: any;
}

abstract class NodeDasar<TData = any> {
    abstract nama: string;
    abstract jalankan(wadah: Wadah<TData>): Promise<Wadah<any>>;

    mulaiLog() {
        console.log(`data ${this.nama} mulai`);
    }

    akhirLog() {
        console.log(`data ${this.nama} akhir`);
    }
}

class NodeLog extends NodeDasar<{ pesan: string }> {
    nama = "Node log";

    async jalankan(wadah: Wadah<{ pesan: string }>): Promise<Wadah<any>> {
        this.mulaiLog();
        console.log(`Pesan diterima: ${wadah.data.pesan}`);
        this.akhirLog();

        return wadah;
    }
}

class NodeAdd extends NodeDasar<{ a: number; b: number }> {
    nama = "Node add";

    async jalankan(wadah: Wadah<{ a: number; b: number }>): Promise<Wadah<any>> {
        this.mulaiLog();

        const result = wadah.data.a + wadah.data.b;
        console.log(`Hasil penjumlahan: ${wadah.data.a} + ${wadah.data.b} = ${result}`);

        this.akhirLog();

        // return wadah plus hasil baru
        return {
            ...wadah,
            result,
        };
    }
}

class NodeConditional extends NodeDasar<Conditional> {
    nama = "Node conditional";

    async jalankan(wadah: Wadah<Conditional> & {result?: number}): Promise<Wadah<any>> {
        const { data } = wadah;

       const left = data.left ?? wadah.result ?? 0
       const right = data.right
       const operator = data.operator

        this.mulaiLog();

        let result: boolean;

        switch (operator) {
            case ">":
                result = left > right;
                break;
            case "<":
                result = left < right;
                break;
            case ">=":
                result = left >= right;
                break;
            case "<=":
                result = left <= right;
                break;
            case "==":
                result = left == right;
                break;
            case "===":
                result = left === right;
                break;
            case "!=":
                result = left != right;
                break;
            case "!==":
                result = left !== right;
                break;
            default:
                throw new Error(`Operator tidak dikenali: ${operator}`);
        }

        console.log(`Evaluasi kondisi: ${left} ${operator} ${right} = ${result}`);

        this.akhirLog();

        return {
            ...wadah,
            conditionalResult: result,
        };
    }
}

async function runWorkFlow(nodes: NodeDasar[], wadahAwal: any) {
    let wadah = wadahAwal;
    for (const node of nodes) {
        wadah = await node.jalankan(wadah);
    }
    return wadah;
}

async function main() {
    const daftarNode = [
        new NodeLog(),
        new NodeAdd(),
        new NodeConditional(),
    ];

    const hasilAkhir = await runWorkFlow(daftarNode, {
        data: {
            pesan: "santai kawan",
            a: 1,
            b: 3,
            operator: ">",
            right: 2,
        },
    });

    console.log("mantap data berhasil:", JSON.stringify(hasilAkhir, null, 2));
}

main();
