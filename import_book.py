import tap
import pathlib





class MainArgs(tap.Tap):
    """
        Book controll Docx directory importer
    """

    target_dir:pathlib.Path # Target book directory

    def configure(self) -> None:
        self.add_argument("target_dir", type=pathlib.Path, help="The target director to import")


def main():

    args = MainArgs().parse_args()

    print(f"Will import from {args.target_dir} with title `{args.target_dir.name}`")

    targets = []

    for element in args.target_dir.iterdir():
        if element.is_file() is False: continue
        if element.name.startswith("~"): continue
        if element.name.startswith("_"): continue
        if element.suffix != '.docx': continue

        print(f"Would import {element.name}")
        targets.append(element)

    reordered = sorted(targets, key= lambda elm: elm.name.lower())

    for target in reordered:
        print(target)







if __name__ == '__main__':
    main()
