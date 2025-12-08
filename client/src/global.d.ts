declare module '*.svg' {
  const svg: string;
  export default svg;
}

declare const styles: { [className: string]: string };
export default styles;

declare module "*.scss" {
    const content: {[className: string]: string};
    export = content;
}