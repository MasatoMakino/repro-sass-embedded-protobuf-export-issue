import { compileAsync } from 'sass-embedded';
const result = await compileAsync("input.scss");
console.log(result.css.toString());