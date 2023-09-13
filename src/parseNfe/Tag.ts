type TagProp<T> = { 
  tagname?: string | null; 
  props?: T 
};

const ATTR = [
  'nitem', 'versao', 'xmlns', 'id', 'xcampo'
]

const CUSTM_ATTR = {
  nfeProc: {
    xmlns:"http://www.portalfiscal.inf.br/nfe"
  },
  NFe: { xmlns:"http://www.portalfiscal.inf.br/nfe" },
  infNFe: {versao: '4.00'}
}
const IGNORE =['procEventoNFe']
export class Tag<T> {
  tagName: string | null = null;

  constructor(params?: TagProp<T>) {
    this.tagName = params?.tagname;
    if (CUSTM_ATTR[this.tagName]) {
      Object.entries(CUSTM_ATTR[this.tagName]).forEach(([key, value]) => {
        this[key] = value;
      })
    }
    Object.entries(params?.props || []).forEach(([key, value]) => {
      if (typeof value === "object") {
        if (value instanceof Array) {
          this[key] = (value as Array<any>).map((el) => {
            return new Tag({ tagname: key, props: el });
          });
        } else {
          this[key] = new Tag({ tagname: key, props: value });
        }
      } else {
        this[key] = value;
      }
    });
  }

  toXml(deep = 1) {
    const tagName = !this.tagName ? this.constructor.name : this.tagName;
    let attributes = "";
    let child = "";
    function getChild(keyName, value, deep) {
      if (value instanceof Array) {
        return value.map((child) => getChild(keyName, child, deep)).join("");
      }
      if (value instanceof Tag) {
        return `\n${Array(deep + 1).join("  ")}${value.toXml(deep + 1)}`;
      } else {
        return `\n${Array(deep + 1).join(
          "  "
        )}<${keyName}>${value}</${keyName}>`;
      }
    }
    Object.keys(this).forEach((key) => {
      const keyName = key;
      if (keyName === "tagName" || IGNORE.includes(keyName)) return;
      if (keyName.startsWith("_") || ATTR.includes(keyName.toLowerCase())) {
        if (keyName === 'versao') attributes = `${attributes} ${keyName.replace("_", "")}="4.00"`; 
        else attributes = `${attributes} ${keyName.replace("_", "")}="${this[key]}"`;
      } else {
        child = `${child}${getChild(keyName, this[key], deep)}`;
      }
    });
    return `${deep === 1 ? '<?xml version="1.0" encoding="UTF-8"?>\n': ''}${!this.tagName ? '' :`<${tagName}${attributes}>`}${child}\n${Array(deep).join(
      "  "
    )}${!this.tagName ? '' :`</${tagName}>`}`;
  }
}
