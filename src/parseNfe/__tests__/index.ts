import { describe, expect, test } from "@jest/globals";
import { Tag } from "../Tag";

class TagTest extends Tag<unknown> {
  tagName='TagTest';
  _attribute = 'MyAttribute'
  nonAttribute = 'this is a child'
}
const TagTestExpected = `<?xml version="1.0" encoding="UTF-8"?>\n<TagTest attribute="MyAttribute">\n  <nonAttribute>this is a child</nonAttribute>\n</TagTest>`

class TagTest2 extends Tag<unknown> {
  tagName='TagTest2';
  _anotherAttribute = 'AnotherAttribute'
  NumericAttribute = 10
  NodeAttribute = new TagTest()
}

const TagTest2Expected = `<?xml version="1.0" encoding="UTF-8"?>\n<TagTest2 anotherAttribute="AnotherAttribute">\n  <NumericAttribute>10</NumericAttribute>\n  ` +
`<TagTest attribute="MyAttribute">\n    <nonAttribute>this is a child</nonAttribute>\n  </TagTest>\n</TagTest2>`

describe('Test Tag class', () => {
  test('should generate xml tag', () => {
    const tag = new TagTest().toXml()
    // console.log(tag)
    expect(tag).toBe(TagTestExpected)
  })

  test('should generate child tag', () => {
    const tag = new TagTest2().toXml()
    // console.log(tag)
    expect(tag).toBe(TagTest2Expected)
  })

})