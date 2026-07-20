type CodeSandboxEmbedProps = {
  sandboxId: string;
};

export function CodeSandboxEmbed({ sandboxId }: CodeSandboxEmbedProps) {
  const src = `https://codesandbox.io/embed/${sandboxId}?fontsize=14&hidenavigation=1&theme=dark`;

  return (
    <div className="swizec-embed swizec-embed-codesandbox">
      <iframe
        src={src}
        title="CodeSandbox embed"
        loading="lazy"
        allow="accelerometer; ambient-light-sensor; camera; encrypted-media; geolocation; gyroscope; hid; microphone; midi; payment; usb; vr; xr-spatial-tracking"
        sandbox="allow-forms allow-modals allow-popups allow-presentation allow-same-origin allow-scripts"
      />
    </div>
  );
}
