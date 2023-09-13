import { Tag } from "./Tag";

export class NFe {
  static parseFromJson(json: any): string {
    return new Tag({ tagname: null, props: json}).toXml();
  }
}
