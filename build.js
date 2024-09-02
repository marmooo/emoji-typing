import { TextLineStream } from "jsr:@std/streams/text-line-stream";
import { hiraToRoma } from "https://raw.githubusercontent.com/marmooo/hiraroma/main/mod.js";

function kanaToHira(str) {
  return str.replace(/[ァ-ヶ]/g, function (match) {
    const chr = match.charCodeAt(0) - 0x60;
    return String.fromCharCode(chr);
  });
}

async function build() {
  const result = [];
  const file = await Deno.open("emoji-ja.lst");
  const lineStream = file.readable
    .pipeThrough(new TextDecoderStream())
    .pipeThrough(new TextLineStream());
  for await (const line of lineStream) {
    const [emoji, category, ja, jaStrict] = line.split(",");
    const roma = hiraToRoma(kanaToHira(ja));
    const row = [emoji, category, roma, ja, jaStrict];
    result.push(row.join(","));
  }
  Deno.writeTextFileSync("src/data/ja.csv", result.join("\n"));
}

await build();
