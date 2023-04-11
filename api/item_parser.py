import re

class ItemParser():
    # mapping from item key to item modifiers
    items_map: dict[str, list[str]]

    @staticmethod
    def parse_item(item: str):
        """Written by gpt4"""
        key = re.sub(r'\([^)]*\)', '', item).strip()
        mods = re.findall(r'\(([^)]+)\)', item)
        mods = [v.strip() for v in mods]
        final_mods = []
        for value in mods:
            final_mods.extend(value.split(','))
        final_mods = [v.strip() for v in final_mods]
        return (key, final_mods)

    def __init__(self, items: list[str]):
        self.items_map = {}
        for item in items:
            key, mods = ItemParser.parse_item(item)
            self.items_map[key] = mods

    def difference(self, new: 'ItemParser'):
        added: list[str] = []
        removed: list[str] = []
        changed: dict[str, dict[str: list[str]]] | None = {}
        for key in self.items_map:
            if key not in new.items_map:
                removed.append(key)
            elif self.items_map[key] != new.items_map[key]:
                added_mods = [m for m in new.items_map[key] if m not in self.items_map[key]]
                removed_mods = [m for m in self.items_map[key] if m not in new.items_map[key]]
                changed[key] = {'added': added_mods, 'removed': removed_mods}
        for key in new.items_map:
            if key not in self.items_map:
                added.append(key)
        # Return null if changed is empty
        if not changed:
            changed = None
        return added, removed, changed
        
        