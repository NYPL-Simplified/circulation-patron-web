module.exports = {
  env: {
    browser: true,
    node: true
  },
  parser: "@typescript-eslint/parser",
  parserOptions: {
    project: "tsconfig.json",
    sourceType: "module"
  },
  plugins: [
    "@typescript-eslint",
    // "@typescript-eslint/tslint",
    "jsx-a11y"
  ],
  extends: ["plugin:jsx-a11y/strict"],
  rules: {
    "@typescript-eslint/class-name-casing": "error",
    // must disable base rule to not cause conflicts
    indent: "off",
    "@typescript-eslint/indent": ["error", 2],
    "@typescript-eslint/member-delimiter-style": [
      "error",
      {
        multiline: {
          delimiter: "none",
          requireLast: true
        },
        singleline: {
          delimiter: "semi",
          requireLast: false
        }
      }
    ],
    "@typescript-eslint/prefer-namespace-keyword": "error",
    "@typescript-eslint/quotes": ["error", "double"],
    // must disable base semi rule and use @typescript-eslint/semi instead
    semi: "off",
    "@typescript-eslint/semi": ["error"],
    "@typescript-eslint/type-annotation-spacing": "error",
    camelcase: "error",
    eqeqeq: ["error", "smart"],
    "id-blacklist": [
      "error",
      "any",
      "Number",
      "number",
      "String",
      "string",
      "Boolean",
      "boolean",
      "Undefined",
      "undefined"
    ],
    "id-match": "error",
    "no-eval": "error",
    "no-redeclare": "error",
    "no-trailing-spaces": "error",
    "no-underscore-dangle": "error",
    "no-var": "error",
    "spaced-comment": "error"

    // a11y rules that are being replaced by "jsx-a11y"
    // "@typescript-eslint/tslint/config": [
    //     "error",
    //     {
    //         "rules": {
    //             "one-line": [
    //                 true,
    //                 "check-open-brace",
    //                 "check-whitespace"
    //             ],
    //             "react-a11y-accessible-headings": true,
    //             "react-a11y-anchors": true,
    //             "react-a11y-aria-unsupported-elements": true,
    //             "react-a11y-event-has-role": true,
    //             "react-a11y-iframes": true,
    //             "react-a11y-image-button-has-alt": true,
    //             "react-a11y-img-has-alt": true,
    //             "react-a11y-input-elements": true,
    //             "react-a11y-lang": true,
    //             "react-a11y-meta": true,
    //             "react-a11y-mouse-event-has-key-event": true,
    //             "react-a11y-no-onchange": true,
    //             "react-a11y-props": true,
    //             "react-a11y-proptypes": true,
    //             "react-a11y-required": true,
    //             "react-a11y-role": true,
    //             "react-a11y-role-has-required-aria-props": true,
    //             "react-a11y-role-supports-aria-props": true,
    //             "react-a11y-tabindex-no-positive": true,
    //             "react-a11y-titles": true,
    //             "whitespace": [
    //                 true,
    //                 "check-branch",
    //                 "check-decl",
    //                 "check-operator",
    //                 "check-separator",
    //                 "check-type"
    //             ]
    //         }
    //     }
    // ]
  }
};
