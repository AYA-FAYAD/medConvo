// interface ExpressError extends Error{
//     statusCode ?: number;
// }

class expressErorr extends Error{
    statusCode?: number;
    constructor(message:string, statusCode:number){
        super();
        
        this.message = message;
        this.statusCode = statusCode;
    }
}

// interface ExpressError {
//     message: string;
//     statusCode?: number;
// }

// class expressErorr extends Error implements ExpressError {
//     constructor(message: string, public statusCode?: number) {
//         super(message);
//     }
// }

module.exports =expressErorr;