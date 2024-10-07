const required = (value, text) => (value ? undefined : text || 'This is a required field.')
const email = (value, text) => value && !/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,5}$/i.test(value) ? text || 'Please provide a valid email address.' : undefined
const url = (value, text) => value && !/[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{2,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)/i.test(value) ? text || 'Please provide a valid url.' : undefined
const password = (value, text) => value && value.length < 6 ? text || 'Minimal length of password is 6 characters' : undefined
export {
    required,
    email,
    url,
    password
}