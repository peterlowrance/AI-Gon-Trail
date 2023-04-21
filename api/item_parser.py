import re

class Item():
    key: str
    modifiers: list[str]

    def __init__(self, item: str):
        self.key = re.sub(r'\([^)]*\)', '', item).strip()
        mods = re.findall(r'\(([^)]+)\)', item)
        mods = [v.strip() for v in mods]
        self.modifiers = []
        for value in mods:
            self.modifiers.extend(value.split(','))
        self.modifiers = [v.strip() for v in self.modifiers]

    def __str__(self):
        res = self.key
        if len(self.modifiers) > 0:
            res += f' ({", ".join(self.modifiers)})'
        return res

    def clone(self):
        return Item(str(self))


class ItemParser():
    # mapping from item key to item modifiers
    items_map: dict[str, list[str]]

    def __init__(self, items: list[str]):
        self.items_map = {}
        for item in items:
            parsed_item = Item(item)
            self.items_map[parsed_item.key] = parsed_item.modifiers

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
        
        