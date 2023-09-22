let
  sources = import ./nix/sources.nix { };
  pkgs = import sources.nixpkgs { };
in pkgs.mkShell {
  buildInputs = [
    pkgs.git
    pkgs.nixfmt
    pkgs.nodejs_20
    pkgs.yarn
    pkgs.esbuild
  ];
}
